export function cliRespond(data: any, message = 'OK', code = 0) {
  console.log(JSON.stringify({ data, message, code }, null, 2));
} 