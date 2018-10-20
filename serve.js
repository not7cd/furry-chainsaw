const ex = require('express');
const app = ex();

app.use('/public', ex.static('public'));

app.listen(3040);
console.log('Check port: 3030 dude🔥');