$(function(){


    var indiceAtual = 0;
    var indiceMaximo = $('.slider img').length; // Pega Quantidade de items definido na classe 
    var deley = 5000;

    initSlider();
    clickSlider();
    
    function initSlider(){
    
       for(var i = 0; i < indiceMaximo; i++){ // se meu ndicemaximo for menor que 0. Adicione + 1

        if (i == 0){

            $('.bullet__nav').append('<span style="background-color: #069;"></span>'); // se for igual a primeira img Adcione o span com estilo! 

       }else{

        $('.bullet__nav').append('<span></span>'); // se não for igual a primeira img Adcione a penas o na cor padrão span!
        }
    }
       

      $('.slider img').eq(indiceAtual).fadeIn() // Abrir a primeira img = 0
            setInterval(function(){
                    alternarSlider();

            }, deley);
    }


    // Função para Alterar as img
    function alternarSlider(){

            $('.slider img').eq(indiceAtual).stop().fadeOut(2000);  // Fechar depos de 2 segundos a img  com indice atual = 0 
            indiceAtual+=1;                                        // Adicionar + 1 de zero foi para 1 então muda indicide assim mundando a img
            if(indiceAtual == indiceMaximo){ // se o meu indice atual chegar no valor do meu indiceMaximo , meu indiceAtual volta para 0 

                indiceAtual = 0 // Retornando para primeira img
            }   

            $('.bullet__nav span').css('background-color' , '#ccc');  // ao mudar o indice defini a cor padrão 
            $('.bullet__nav span').eq(indiceAtual).css('background-color' , '#069'); // novo indice recebe nova cor
            $('.slider img').eq(indiceAtual).stop().fadeIn(2000);   // depois de 2 segundos abra a proxíma img
           

    }

        // Quando cliar no span faça
    function clickSlider(){ 

        $('.bullet__nav span').click(function(){

            $('.slider img').eq(indiceAtual).stop().fadeOut(2000); // Feche a img com indice atual selecionado

            indiceAtual = $(this).index(); // pega todos os valores , abre a proxima img é defini a cor padrão novamente
            $('.slider img').eq(indiceAtual).stop().fadeIn(2000); // Abra nova img com novo indice
            $('.bullet__nav span').css('background-color' , '#ccc'); // Defina cor padrão novamente para antigo indice
            $(this).css('background-color' , '#069');                // Defina  style para novo para item  selecionado


        });

    }
    




});


