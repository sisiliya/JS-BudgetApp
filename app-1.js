/*********************************************************************/

// Implementing the Module Pattern
// Seperations of concerns

// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    var Income = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value; 

    };

    Expense.prototype.calculatePercentage = function(totalIncome) {

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var calcTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0, 
        percentege: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            
            var ids, index;

            // Example: id = 3
            // data.allItems[type][id] ->> false
            // ids = [1 2 4 6 8]
            // index = 3

            ids = data.allItems[type].map(function(current) {

                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }


        },

        calcBudget: function() {

            // Calculate total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp ;


            // Calculate the percentege of income that we spent
            if(data.totals.inc > 0) {
                data.percentege = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentege = -1;
            }

        },

        calcPecentages: function() {

            /*
            a=20
            b=10
            c=40
            income = 100
            percA = a / income * 100 ->> 20%
            percB = b / income * 100 ->> 10%
            percC = c / income * 100 ->> 40%
            */

            // my way ->> 
            // data.allItems.exp.forEach(element => element.calculatePercentages());

            // his way ->>
            data.allItems.exp.forEach(function(curr) {
                curr.calculatePercentage(data.totals.inc);
            });


        },

        getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage()
            });
            return allPerc;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data. totals.exp,
                percentage: data.percentege
            }
        },


        testing: function() {
            console.log('paxa');
            console.log(data)

        }
    };


})();



// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {

        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value', 
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {

        var numSplit, int, dec, sign;

        // + or - before number
        // exactly 2 decimal points
        // comma separating the thousands

        // ex: 2310.4567 ->> + 2,310.46
        // ex: 2000 ->> + 2,000.00

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
            // input 2310 ->> output 2,310
        }

        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';

        // return sign + ' ' + int + dec;

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {

        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };

    return {
        getInput: function() {

            return {

                // will be either inc or exp
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

            };
        },

        addListItem: function(object, type) {

            // Create HTML string with placeholder text
            var html, newHtml, element;

            if(type === 'inc') {

                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {

                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // Replace the placeholder text with actual data

            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        }, 

        deleteListItem: function(selectedID) {

            var element = document.getElementById(selectedID);

            element.parentNode.removeChild(element);

        },

        clearFields: function() {
            
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            // fields.slice(); ->> nodeList to Array

            // ->>> VIJ KAKYV MU E PROBLEMA 
            // var fieldArray = fields.slice();
            // fieldArray.forEach(function(curr, index) {
            //     if(percentages[index] > 0 ) {
            //         curr.textContent = percentages[index] + '%';
            //     } else {
            //         curr.textContent = '-'
            //     }
            // })

            
            nodeListForEach(fields, function(curr, index) {

                if(percentages[index] > 0) {
                    curr.textContent = percentages[index] + '%';
                } else {
                    curr.textContent = '---';
                }

            })

        },

        displayMonth: function() {

            var year, now, month, months;

            var now = new Date();
            // var christmas = new Date(2016, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            year = now.getFullYear();
            month = months[now.getMonth()];
            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue 
            );

            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    }

})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {

        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {

            if(event.keyCode === 13 || event.which === 13) {
    
                ctrlAddItem();
            }
    
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetController.calcBudget();

        // 2. Method to return the budget
        var budget = budgetController.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calc the %

        budgetCtrl.calcPecentages();

        // 2. Read the percentages from the budget controller

        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages

        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {

        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIController.clearFields();

            // 5. Calculate and return budget
            updateBudget();

            // 6. Update percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function(event) {

        var itemId, splitID, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {

            // inc-id
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure

            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from the UI

            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget

            updateBudget();

            // 4. Update percentages
            updatePercentages();



        }

    };

    
    return {
        init: function() {
            console.log('app started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
            });
            setUpEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();

































