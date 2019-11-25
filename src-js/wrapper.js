const wrap = function(obj, org_fn_name, wrapper) {
  const org_fn = obj[org_fn_name];

  return obj[org_fn_name] = function() {
    wrapper.apply(obj, [org_fn].concat(Array.prototype.slice.call(arguments)));
  }
};

const Test = function() {
};
Test.prototype.sayHello = () => {
  console.log('hello');
};

wrap(Test.prototype, 'sayHello', function(fn, arg1, arg2) {
  console.log('wrapper: ', arg1);
  fn(arg1, arg2);
  console.log('wrapper: ', arg2);
});

const test = new Test();
test.sayHello('hey', 'bye');
