var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
var vo        = require('vo'); 

const URL = 'http://www.zapimoveis.com.br/venda/casas/go+goiania/'

var list = []; 

//Zap structure: 
/*
  article#list
        |
        div.box-default (has many)
               |
               figure.img-container
                         |
                     div.gallery-item-overlay.no-show
                                      |
                                      div.list-cell
                                            |
                                             - - - - h3 > span (price)
                                            |
                                             - - - - h2 > span[0] (sector), span[1] (street), span[2] (city and state), span[3] (type)
                                            |
                                             - - - - ul.inline
                                                         |
                                                          - > li[0] (rooms), li[1] (suites), li[2] (parking spaces), li[3] (m²)
*/

function evaluate(){
    var temp = $('#list > div.box-default > figure.img-container > div.gallery-item-overlay.no-show > div.list-cell'); 
    
    var array = []; 

    var house ={
      price : '', 
      sector: '', 
      street: '', 
      city  : '',
      type  : '', 
      room  : '',
      suite : '', 
      park  : '', 
      m2    : ''
    }

    temp.each(function(id, val){
      house.price = $($(this).find('h3 > span')[0]).text(); 

      var spans   = $(this).find('h2 > span'); 

      house.sector = $(spans[0]).text();  
      house.street = $(spans[1]).text();  
      house.city   = $(spans[2]).text();  
      house.type   = $(spans[3]).text();  

      var lis      = $(this).find('ul.inline > li'); 

      house.room   = $(lis[0]).text();
      house.suite  = $(lis[1]).text();
      house.park   = $(lis[2]).text();
      house.m2     = $(lis[3]).text();  
      // console.log(house); 
      array.push(house); 
    });

    return array; 
}

function* scrap(){
  yield nightmare
        .goto(URL)
        .wait('#list')

  has_next = true; 

  while(has_next){
    has_next = yield nightmare.visible('#proximaPagina')
  
    yield nightmare
          .evaluate(evaluate)
          .then(function(result){
            console.log(result); 
          }); 
    

    yield nightmare
    .click('#proximaPagina')
    .wait(10000); 
  }

  yield nightmare.end(); 
}


vo(scrap)(function(err, result) {
    if (err) throw err;
});