import { Server } from './app';
import dotenv from 'dotenv';

dotenv.config();

void new Server().bootstrap();
