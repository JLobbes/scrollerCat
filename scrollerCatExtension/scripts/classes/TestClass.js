(function() {
    class TestClass {
      constructor() {
        console.log('TestClass initialized');
      }
  
      someMethod() {
        console.log('TestClass method');
      }
    }
  
    // Attach the Class1 to the window object
    window.TestClass = TestClass;
  })();
  