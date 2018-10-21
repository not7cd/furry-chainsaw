const ex = require('express');
const app = ex();

app.use(ex.static('public'));

app.listen(3040);
console.log('Check port: 3040 dude🔥');