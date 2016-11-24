var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
var vo        = require('vo'); 
var fs        = require('fs'); 

// const URL = 'http://www.zapimoveis.com.br/venda/casas/go+goiania/'
const URL = 'http://www.zapimoveis.com.br/venda/imoveis/go+goiania/#{"precomaximo":"2147483647","parametrosautosuggest":[{"Bairro":"","Zona":"","Cidade":"GOIANIA","Agrupamento":"","Estado":"GO"}],"pagina":"1","ordem":"Relevancia","paginaOrigem":"ResultadoBusca","semente":"1632872624","formato":"Lista"}'; 
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

//function to interact with the body of Zap
function evaluate(){
    var temp = $('#list > div.box-default > figure.img-container > div.gallery-item-overlay.no-show > div.list-cell'); 
    var array = []; 

    for(var a = 0; a < temp.length; a++){
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
      }; 

      house.price = $($(temp[a]).find('h3 > span')[0]).text(); 

      var spans   = $(temp[a]).find('h2 > span'); 

      house.sector = $(spans[0]).text();  
      house.street = $(spans[1]).text();  
      house.city   = $(spans[2]).text();  
      house.type   = $(spans[3]).text();  

      var lis      = $(temp[a]).find('ul.inline > li'); 

      house.room   = $(lis[0]).text();
      house.suite  = $(lis[1]).text();
      house.park   = $(lis[2]).text();
      house.m2     = $(lis[3]).text();  

      array.push(house); 
    }

    return array; 
}

//function to interact with result function above. 
var list = []; 
function proccess(result){
  for(var b of result)
      fs.appendFile('./data/data_zap.txt', JSON.stringify(b)+'\n', 'utf8', (error) => console.log(error));
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
          .then(proccess); 
    

    yield nightmare
    .click('#proximaPagina')
    .wait(10000); 
  }

  yield nightmare.end(); 
}


vo(scrap)(function(err, result) {
    if (err) throw err;
});