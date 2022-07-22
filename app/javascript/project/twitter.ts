function sayHello(name: string): void {
  console.log(`Hello, ${name}. Current datetime is ${new Date()}`);
}

document.addEventListener('turbo:load', function() {
  sayHello('TypeScript');
});

