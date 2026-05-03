function test(index) {
    console.log("test_1: ", index.value);
    testFunc(index);
    console.log("test_2: ", index.value);
}

function testFunc(index) {
    index.value += 1;
}

test({ value: 1 });
