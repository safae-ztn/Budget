// budget controller
var budgetController = (function() {
    
    var Revenu = function(id , description , value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Frais = function(id , description , value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //all obj that are created from Frais constructor will herite this Methodes because of ptototype property
    Frais.prototype.calculPercentage = function(totalRevenu) {
        if(totalRevenu > 0){
            this.percentage = Math.round((this.value / totalRevenu ) * 100) ;
        }else {
            this.percentage = -1;
        }
    };
    Frais.prototype.getPercentage = function() {
        return this.percentage;
    };

    var calcuteTotal = function(type) {
        var som=0;
        allData.allItems[type].forEach(function(current) {
            som += current.value;  
        });
        allData.totalItems[type] = som;
    };
    var allData = {
        allItems: {
            revenu: [],
            frais: []
        },
        totalItems: {
            revenu: 0.0,
            frais: 0.0
        },
        budget : 0,
        percentage : -1
    };
    return {
        addItem : function(type, desc,val) {
            var newItem,ID;

            //generer ID suivant
            if(allData.allItems[type].length > 0){
                ID = allData.allItems[type][allData.allItems[type].length -1].id +1;
            }else {
                ID = 0;
            }
            //create a new item
            if(type === 'revenu' ){
                newItem = new Revenu(ID, desc, val);
            }else if(type === 'frais'){
                newItem = new Frais(ID, desc, val);
            }
            //ajouter le new item au allItems
            allData.allItems[type].push(newItem);
            //erturner new item
            return newItem;
        },

        deleteItem: function(type, ID) {
            var IDs, index; 
            //allData.allItems[type][id]; si on a un tab like that [0,1,2,3,4,5] 
            //mais si on supp qlq elt on obtient [0,2,4,5] il n ya pas d'ordre => IDs
            // sin on veut l'elt 4 c'est de l'index 2
            IDs = allData.allItems[type].map(function(current) {
                return current.id;
            });
            //find the index
            index = IDs.indexOf(ID);//va etre -1 si id n'existe pas
            //on supp l'elt d'index index
            if(index !== -1){//use splice methode to remove the item
                allData.allItems[type].splice(index, 1);//on vas supp à partir de l'indice index et on vas supp un seul elt
            }
        },

        calculateBudget: function() {
            //calculer total des revenus et des frais
            calcuteTotal('revenu');
            calcuteTotal('frais');
            //calculer le budget total (revenu total - frais total)
            allData.budget = allData.totalItems.revenu - allData.totalItems.frais ;
            //calculer le pourcentage des frais
            if(allData.totalItems.revenu > 0){
                allData.percentage = Math.round((allData.totalItems.frais / allData.totalItems.revenu) * 100);//Math.round : pour prendre juste la partie entiere
            }else{
                allData.percentage = -1;
            }
        },
        getBudget: function() {
            return {
                budget: allData.budget,
                totalRevenu: allData.totalItems.revenu,
                totalFrais: allData.totalItems.frais,
                percentage: allData.percentage
            };
        },

        calculatePercentages: function() {
            //a=80  b=30  income=100
            //a=80/100=80%   b=30/100=30%
            allData.allItems.frais.forEach(function(courant) {
                courant.calculPercentage(allData.totalItems.revenu);
            });
        },
        getPercentages: function() {
            var allPercentage = allData.allItems.frais.map(function(courant) {
                return courant.getPercentage();
            });
            return allPercentage;
        },

        testing: function() {
            console.log(allData);
        }
    };  

})();

//UI controller
var UIController = (function() {
    var DOMdata = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        addBtn : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        labelBudget:'.budget__value',
        labelRevenu:'.budget__income--value',
        labelFrais:'.budget__expenses--value',
        labelPercentage:'.budget__expenses--percentage',
        container:'.container',
        fraisPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    // to formate our numbers ( number is output of this methode and we get the output like formated number)
    var getFormatedNumber= function(num, type) {
        var numberSplit, integer, decimal, type ;
        // 1. + or - before the number
        num = Math.abs(num);
        // 2. 2 chiffre apres la vergule
        num = num.toFixed(2);//prototype methode of strings (will return string with 2 numbers after comma )
        // 3. un espace entre les 3 chiffres
        numberSplit = num.split('.');//il va retourner un tab de 2 cases
        integer = numberSplit[0];
        if(integer.length >3 ){
            integer = integer.substr(0,integer.length -3) + ' ' + integer.substr(integer.length -3 ,3) ;
            //the first param is the index that we want to start with it and the second is how many we want to read
            // 23651 -> 23,651
        }
        decimal = numberSplit[1];

        return  (type === 'frais' ? '-' : '+') + integer + '.' + decimal;
    };

    var nodeListForeEach = function(list, callBack){
        for(var i =0; i<list.length; i++){
            callBack(list[i], i);
        }
    };

    return {
        getInputData: function() {
            return {
                type: document.querySelector(DOMdata.inputType).value,// (+ ou -) revenu ou frais
                description: document.querySelector(DOMdata.inputDescription).value,
                value: parseFloat(document.querySelector(DOMdata.inputValue).value)
            }; 
        },

        addListItem: function(obj, type){
            var html , newHtml, element;
            //create a html string with placeholder text
            if(type === 'revenu'){
                element = DOMdata.incomeContainer;
                html = '<div class="item clearfix" id="revenu-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'frais'){
                element = DOMdata.expensesContainer;
                html = '<div class="item clearfix" id="frais-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', getFormatedNumber(obj.value, type));

            //insert html into DOMdata
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            var elt = document.getElementById(selectorID);
            elt.parentNode.removeChild(elt);
        },

        clearInputField: function(){
            var fields, fieldArr ;
            fields = document.querySelectorAll(DOMdata.inputDescription + ', ' + DOMdata.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldArr[0].focus();//add the focus at descrption unputField
        },

        afficherBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'revenu' : type = 'frais';
            document.querySelector(DOMdata.labelBudget).textContent = getFormatedNumber(obj.budget,type);
            document.querySelector(DOMdata.labelRevenu).textContent = getFormatedNumber(obj.totalRevenu, 'revenu');
            document.querySelector(DOMdata.labelFrais).textContent = getFormatedNumber(obj.totalFrais, 'frais');
            if(obj.percentage > 0){//verifier qui'il y a un pourcentage 
                document.querySelector(DOMdata.labelPercentage).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMdata.labelPercentage).textContent = '---';
            }
        },

        afficherPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMdata.fraisPercLabel);
            
            nodeListForeEach(fields, function(current, index) {
                // do our traitement 
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },

        afficherDate : function() {
            var now, month, monthLabel, year;

            now = new Date();
            monthLabel = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMdata.dateLabel).textContent = monthLabel[month] + ' ' + year ;

        },

        changerType: function() {
            var fields = document.querySelectorAll(
                DOMdata.inputType +',' +
                DOMdata.inputDescription + ',' +
                DOMdata.inputValue
            );
            nodeListForeEach(fields, function(current) {
                current.classList.toggle('red-focus');//add element if not there and remove it if is there 
            });
            document.querySelector(DOMdata.addBtn).classList.toggle('red');
        },

        getDOMdata: function() {
            return DOMdata;
        }
    };  
})();

// global app controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function(){
        var DOM = UICtrl.getDOMdata();
        //press the button
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);/* DOM.addBtn*/ 
        //press enter
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        }); 
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changerType);
    };

    var updateBudget = function() {
        //calculer le budget
        budgetCtrl.calculateBudget();
        //retourner le budget
        var budget = budgetCtrl.getBudget();
        //afficher le budget total
        UICtrl.afficherBudget(budget);
    };

    var updatePercentages = function() {
        //calculate percentage
        budgetCtrl.calculatePercentages();

        //read the percentage from budgetController
        var percentages = budgetCtrl.getPercentages();

        //update the UI with the new Percentage 
        UICtrl.afficherPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var inputData, newItem;

        // recuperation des donnée de input field
        inputData = UICtrl.getInputData();

        //chack if the data OF inputFields is valable or
        if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value >0){
            //console.log(inputData);
            newItem = budgetCtrl.addItem(inputData.type, inputData.description, inputData.value);

            // ajouter item dans budget controller and clear inputs Field
            UICtrl.addListItem(newItem, inputData.type);
            UICtrl.clearInputField();

            // update the budget
            updateBudget();

            //update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {//we use event to know what the target item is !!
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;// we want to get the fourth parent (<div class="item clearfix" id="income-0">) to icon when we click
        if(itemID){//ganna be true if itemID existe and false if not
            splitID = itemID.split('-');//if we have for exemple string s= 'revenu-1' it will return array ["revenu", "1"]
            type = splitID[0];// revenu
            ID = parseInt(splitID[1]); // 1

            //1_ delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2_ delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3_ update the badget
            updateBudget();

            //4_update percentages
            updatePercentages();

        }
    };

    return {
        init: function() {
            console.log('app has started !');
            UICtrl.afficherDate();
            UICtrl.afficherBudget({
                budget:0,
                totalRevenu:0,
                totalFrais:0,
                percentage: -1
            });
            setupEventListener();
        }
    }; 
    
})(budgetController, UIController);

controller.init();