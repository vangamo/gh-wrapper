import JsonCrud from './lib/port/jsonPort.js';

const a = new JsonCrud('me');

console.log( a );

console.log( a.get() );
console.log( a.read() );

console.log( a.get({id:1}) );
console.log( a.read({id:1}) );
console.log( a.read({me: "value"}) );