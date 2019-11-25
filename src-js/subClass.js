/**
 * 책 inside javascript 6.4장 객체지향 프로그래밍 응용 예제 테스트
 *
 * type 을 정의할 때 사용할 객체가 closure를 사용하면(line 43) 오류가 있을것 같아 테스트해봄.
 * 결과는 오류 있음.
 * 타입을 정의한 후 같은 타입의 객체를 여러개 만들면 모두 같은 자유변수를 참조하기 때문에 name 프로퍼티가 공유됨.
 * 때문에 name이 다른 객체를 생성할 수 없음.
 *
 * @type {function(*): child}
 */
const subClass = (() => {
  const F = function() {};

  const _subClass = function(obj) {
    const parent = (!this ? Function : this);
    const child = function() {
      const _parent = child.parent;
      if (_parent && _parent !== Function) {
        parent.apply(this, arguments);
      }

      if (child.prototype.hasOwnProperty('_init')) {
        child.prototype._init.apply(this, arguments);
      }
    }

    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.parent = parent;
    child.subClass = _subClass;

    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        child.prototype[prop] = obj[prop];
      }
    }

    return child;
  }

  return _subClass;
})();

const person = function() {
  let _name = undefined;

  return {
    _init: name => {
      _name = name;
    },
    getName: () => {
      return _name;
    },
    setName: name => {
      _name = name;
    }
  }
};

const Person = subClass(person());
const suzi = new Person('suzi');
console.log(suzi.getName());
const seo = new Person('seo');
console.log(suzi.getName());
suzi.setName('zisu');
console.log(seo.getName());

const Student = Person.subClass();
const student = new Student('student');
console.log(student.getName());
const student2 = new Student('student2');
console.log(student.getName());

/*
 // 결과
 suzi
 seo
 zisu
 student
 student2
 */
