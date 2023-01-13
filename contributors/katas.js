//kata1

/*const sumLargestNumbers= function(arr) {
    let sum = 0;
    for (let i=0; i<arr.length; i++) {
        let count =0;
        for (let j=0; j<arr.length; j++){
            if (arr[i]>arr[j]) {
                 count++;
            }
        }
        if (count >= arr.length-2) {
            sum = sum + arr[i];
        } 
    }
    return sum;
}*/

//kata1 revised

/*const sumLargestNumbers = function(arr) {
    for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++){
        if (arr[i] < arr[j]) {
        let x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
      }
    }
}
return arr[arr.length-1]+arr[arr.length-2]
}*/


//kata2
/*const conditionalSum = function(arr, condition) {
    let sum = 0;
    for(let i=0; i<arr.length; i++) {
        if(condition === "even") {
            if (i%2===0) {
                sum += i;
            }
        }
            else if(condition === "odd") {
                if (i%2===1) {
                    sum += i;
                }
        }
    }
    return sum;
}*/

//kata3

/*const numberOfVowels = function(data) {
    let count = 0;
    for (let i=0; i<data.length; i++) {
        if (data[i]==='a' || data[i]==='e' || data[i]==='i' ||data[i]==='o' ||data[i]==='u') {
            count +=1;
        }
    }
    return count;
}*/

//kata4

/*const instructorWithLongestName = function(instructors) {
    let longestName = instructors[0];
     for (let i=1; i<instructors.length; i++) {
        if (instructors[i].name.length > longestName.name.length) {
            longestName = instructors[i];
        }
    }
    return longestName;
}*/

//kata5

/*const urlEncode = function(text) {
  let textTrim = text.trim();
  let arrText = [];
    for (let i=0; i<textTrim.length; i++) {
        arrText[i] = textTrim[i];
    }
    for (let i=0; i<arrText.length; i++) {
        if (arrText[i] === ' ') {
            arrText[i] = '%20';
        }
    }
 return arrText.join('');
}*/

//kata6

/*const whereCanIPark = function (spots, vehicle) {
    for (let i=0; i<spots.length; i++) {
        for (let j=0; j<spots[i].length; j++){
            if (vehicle==="regular") {
                if (spots[i][j] ==="R") {
                    return [j,i];
                }
            }
            else if (vehicle==="small") {
                if (spots[i][j] ==="S" || spots[i][j] ==="R") {
                    return [j,i];
                }
            }
            else if (vehicle==="motorcycle") {
                if (spots[i][j] ==="M" || spots[i][j] ==="S" || spots[i][j] ==="R") {
                    return [j,i];
                }
            }
        }
    }
    return false;
}*/

//kata7

/*const checkAir = function (samples, threshold) {
    let dirtyCount=0;
    for (let i=0; i<samples.length; i++){
        if (samples[i] === "dirty") {
            dirtyCount++;
        }
    }
    if (dirtyCount/samples.length < threshold) {
        return "Clean";
    } else {
        return "Polluted";
    }
  };*/

//kata6again

/*const repeatNumbers = function(data) {
    var finalValue = '';
    for (let i=0; i<data.length; i++) {
       for (let j=0; j<data[i][1]; j++) {
           finalValue = finalValue + data[i][0];
       }
       if(i<data.length-1) {
           finalValue = finalValue + ', '
       }
   }
   return finalValue;
  };*/

//kata7again

/*const camelCase = function(input) {
    let arrInput = input.split(' ');
    for (let i=1; i<arrInput.length; i++) {
          arrInput[i] = arrInput[i][0].toUpperCase() + arrInput[i].slice(1);
    }
    return arrInput.join('');
};*/

//kata8

/*const multiplicationTable = function(maxValue) {
    let table = [];
    for (let i=0; i<maxValue; i++) {
        let table2d = [];
        for (let j=0; j<maxValue; j++) {
            table2d.push((i+1)*(j+1));
        }
        table.push(table2d);
    }
    return table;
};*/

