import { Service } from 'typedi';

@Service()
export class Logger {
  info(message: string) { console.log(message); }
  success(message: string) { console.log(message); }
  error(message: string) { console.error(message); }
  warning(message: string) { console.warn(message); }
} 