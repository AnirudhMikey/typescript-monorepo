export class ConsoleView {
  showSuccess(message: string) { console.log(message); }
  showError(message: string) { console.error(message); }
  showData(data: any) { console.log(JSON.stringify(data, null, 2)); }
} 