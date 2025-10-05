var h1 = React.createElement('h1', {}, 'Hello World from React');

var parent = document.querySelector("#parent");

var root = ReactDOM.createRoot(parent);

root.render(h1);
