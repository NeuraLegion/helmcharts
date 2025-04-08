#!/usr/bin/env python3

import os
import re
import json
import urllib.request
import argparse
import sys


def get_docker_tags(docker_repo, tag_prefix, max_results=100):
    """
    Fetch Docker tags from Docker Hub for a specific repository and filter by prefix.
    
    Args:
        docker_repo (str): Docker repository name (e.g., "brightsec/brokencrystals")
        tag_prefix (str): Prefix to filter tags (e.g., "stable-")
        max_results (int): Maximum number of results to fetch from Docker Hub API
        
    Returns:
        list: List of tuples (timestamp, tag) sorted by timestamp
    """
    print(f"=== FETCHING TAGS FOR {docker_repo} WITH PREFIX {tag_prefix} ===")
    
    # Get tags from Docker Hub
    url = f"https://hub.docker.com/v2/repositories/{docker_repo}/tags?page_size={max_results}"
    
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
    
    # Filter tags that start with our prefix and have timestamps
    matching_tags = []
    for tag_data in data['results']:
        tag = tag_data['name']
        if tag.startswith(tag_prefix):
            # Extract timestamp if present (14 digits at the end)
            timestamp_match = re.search(r'(\d{14})$', tag)
            if timestamp_match:
                timestamp = timestamp_match.group(1)
                matching_tags.append((timestamp, tag))
    
    if not matching_tags:
        print(f"No tags found with prefix: {tag_prefix}")
        return []
    
    # Sort by timestamp (newest last)
    matching_tags.sort()
    
    # Print all matching tags
    print("=== ALL MATCHING TAGS (NEWEST AT BOTTOM) ===")
    for timestamp, tag in matching_tags:
        print(f"{timestamp}: {tag}")
    
    return matching_tags


def get_latest_tag(matching_tags):
    """
    Get the latest tag from the list of matching tags.
    
    Args:
        matching_tags (list): List of tuples (timestamp, tag) sorted by timestamp
        
    Returns:
        str: Latest tag, or None if no tags are found
    """
    if not matching_tags:
        return None
    
    # Get the latest tag (last in the sorted list)
    _, latest_tag = matching_tags[-1]
    print(f"=== LATEST TAG FOUND: {latest_tag} ===")
    
    return latest_tag


def increment_chart_version(chart_yaml_file):
    """
    Increment the version number in Chart.yaml file.
    
    Args:
        chart_yaml_file (str): Path to the Chart.yaml file
        
    Returns:
        tuple: (new_version, current_version) or (None, None) if failed
    """
    try:
        # Read current Chart.yaml
        with open(chart_yaml_file, 'r') as f:
            chart_content = f.read()
        
        # Find current version
        version_match = re.search(r'version:\s*(\d+\.\d+\.\d+)', chart_content)
        if not version_match:
            print("ERROR: Could not find version in Chart.yaml")
            return None, None
        
        current_version = version_match.group(1)
        print(f"=== CURRENT CHART VERSION: {current_version} ===")
        
        # Parse version components
        version_parts = current_version.split('.')
        if len(version_parts) != 3:
            print(f"ERROR: Unexpected version format: {current_version}")
            return None, None
        
        # Increment patch version
        major, minor, patch = version_parts
        new_patch = int(patch) + 1
        new_version = f"{major}.{minor}.{new_patch}"
        
        # Update Chart.yaml
        updated_chart_content = chart_content.replace(
            f"version: {current_version}", 
            f"version: {new_version}"
        )
        
        # Write updated file
        with open(chart_yaml_file, 'w') as f:
            f.write(updated_chart_content)
        
        print(f"=== UPDATED CHART VERSION: {current_version} → {new_version} ===")
        return new_version, current_version
    
    except Exception as e:
        print(f"ERROR: Failed to update Chart version: {e}")
        return None, None


def update_chart_tag(values_file, latest_tag, chart_yaml_file=None):
    """
    Update the Docker image tag in the Helm chart values file and increment chart version if needed.
    
    Args:
        values_file (str): Path to the values.yaml file
        latest_tag (str): New tag to set in the file
        chart_yaml_file (str, optional): Path to the Chart.yaml file for version increment
        
    Returns:
        tuple: (update_needed, current_tag, updated_chart_version, current_chart_version)
    """
    # Read current tag from values.yaml
    with open(values_file, 'r') as f:
        values_content = f.read()
    
    # Extract current tag
    current_tag_match = re.search(r'images:\s*\n\s*main:\s*(\S+)', values_content)
    if current_tag_match:
        current_tag = current_tag_match.group(1)
        print(f"=== CURRENT TAG IN VALUES.YAML: {current_tag} ===")
    else:
        print("ERROR: Could not find current tag in values.yaml")
        return False, None, None, None
    
    # Compare and determine if update is needed
    if current_tag != latest_tag:
        print("=== UPDATE NEEDED: YES ===")
        
        # Update the file directly
        print(f"Updating {values_file} file...")
        updated_content = values_content.replace(f"main: {current_tag}", f"main: {latest_tag}")
        
        # Double-check we made a change
        if updated_content == values_content:
            print("Direct replacement failed. Trying regex approach...")
            updated_content = re.sub(r'(images:\s*\n\s*main:)\s*\S+', r'\1 ' + latest_tag, values_content)
        
        # Verify the update succeeded
        if updated_content == values_content:
            print("ERROR: Failed to update the file content!")
            return False, current_tag, None, None
        
        # Write the updated file
        with open(values_file, 'w') as f:
            f.write(updated_content)
        
        # Update Chart.yaml version if provided
        updated_chart_version = None
        current_chart_version = None
        if chart_yaml_file and os.path.exists(chart_yaml_file):
            updated_chart_version, current_chart_version = increment_chart_version(chart_yaml_file)
        
        return True, current_tag, updated_chart_version, current_chart_version
    else:
        print("=== UPDATE NEEDED: NO ===")
        return False, current_tag, None, None


def main():
    """
    Main function to check for new Docker tags and update Helm chart values.
    """
    parser = argparse.ArgumentParser(description='Check for new Docker image tags and update Helm chart')
    parser.add_argument('--docker-repo', default='brightsec/brokencrystals', help='Docker repository name')
    parser.add_argument('--tag-prefix', default='stable-', help='Tag prefix to filter')
    parser.add_argument('--values-file', default='charts/brokencrystals/values.yaml', help='Path to values.yaml file')
    parser.add_argument('--chart-file', default='charts/brokencrystals/Chart.yaml', help='Path to Chart.yaml file')
    parser.add_argument('--output-file', help='Path to GitHub Actions output file')
    args = parser.parse_args()

    # Get Docker tags
    matching_tags = get_docker_tags(args.docker_repo, args.tag_prefix)
    
    if not matching_tags:
        return 1
    
    # Get latest tag
    latest_tag = get_latest_tag(matching_tags)
    
    if not latest_tag:
        return 1
    
    # Update chart if needed
    update_needed, current_tag, updated_chart_version, current_chart_version = update_chart_tag(
        args.values_file, 
        latest_tag,
        args.chart_file
    )
    
    # Write output for GitHub Actions if output file is specified
    if args.output_file:
        with open(args.output_file, 'a') as f:
            f.write(f"latest_tag={latest_tag}\n")
            
            if current_tag:
                f.write(f"current_tag={current_tag}\n")
            
            if update_needed:
                f.write("update_needed=true\n")
                # Let the PR action handle branch naming
                # Just suggest a branch name
                f.write(f"suggested_branch=update-docker-image-tag-{latest_tag}\n")
                
                if updated_chart_version:
                    f.write(f"updated_chart_version={updated_chart_version}\n")
                
                if current_chart_version:
                    f.write(f"current_chart_version={current_chart_version}\n")
            else:
                f.write("update_needed=false\n")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
