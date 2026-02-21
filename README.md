# 🎞️ jQuery Slider

Slider de imagens desenvolvido com **jQuery puro**, criado com fins de estudo para praticar:

* Manipulação de DOM
* Controle de índice
* Eventos de clique
* Animações com `fadeIn()` e `fadeOut()`
* Criação dinâmica de elementos
* Uso de `setInterval()`

---

## 🚀 Demonstração

> Slider automático com navegação por bullets
> Transição suave entre imagens
> Controle manual via clique

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* jQuery

---

## 📂 Estrutura Esperada do HTML

```html
<div class="slider">
    <img src="img1.jpg" />
    <img src="img2.jpg" />
    <img src="img3.jpg" />
</div>

<div class="bullet__nav"></div>
```

---

## ⚙️ Como Funciona

### 🔹 1. Inicialização

* Conta o número total de imagens
* Cria dinamicamente os bullets
* Exibe a primeira imagem
* Inicia a troca automática com `setInterval`

---

### 🔹 2. Alternância Automática

A função `alternarSlider()`:

* Oculta a imagem atual
* Incrementa o índice
* Reseta para `0` ao atingir o limite
* Atualiza a cor do bullet ativo
* Exibe a próxima imagem

---

### 🔹 3. Navegação Manual

Ao clicar em um bullet:

* A imagem atual é ocultada
* O índice é atualizado
* A nova imagem é exibida
* O bullet recebe destaque

---

## ⏱️ Configurações

Dentro do script você pode alterar:

```javascript
var deley = 5000; // Tempo entre trocas (5 segundos)
```

```javascript
.fadeOut(2000)
.fadeIn(2000)
```

Tempo das animações (2 segundos)

---

## 📜 Código Principal

```javascript
$(function(){

var indiceAtual = 0;
var indiceMaximo = $('.slider img').length;
var deley = 5000;

initSlider();
clickSlider();

function initSlider(){

   for(var i = 0; i < indiceMaximo; i++){

    if (i == 0){
        $('.bullet__nav').append('<span style="background-color: #069;"></span>');
   }else{
        $('.bullet__nav').append('<span></span>');
    }
}
   
  $('.slider img').eq(indiceAtual).fadeIn();

  setInterval(function(){
        alternarSlider();
  }, deley);
}

function alternarSlider(){

    $('.slider img').eq(indiceAtual).stop().fadeOut(2000);
    indiceAtual+=1;

    if(indiceAtual == indiceMaximo){
        indiceAtual = 0;
    }   

    $('.bullet__nav span').css('background-color' , '#ccc');
    $('.bullet__nav span').eq(indiceAtual).css('background-color' , '#069');

    $('.slider img').eq(indiceAtual).stop().fadeIn(2000);
}

function clickSlider(){ 

    $('.bullet__nav span').click(function(){

        $('.slider img').eq(indiceAtual).stop().fadeOut(2000);

        indiceAtual = $(this).index();

        $('.slider img').eq(indiceAtual).stop().fadeIn(2000);

        $('.bullet__nav span').css('background-color' , '#ccc');
        $(this).css('background-color' , '#069');
    });
}

});
```

---

## 🎯 Objetivo do Projeto

Este projeto foi criado para:

* Consolidar conceitos básicos de jQuery
* Entender controle de estados com índice
* Praticar animações simples
* Trabalhar com eventos e manipulação dinâmica

---

## 📌 Melhorias Futuras

* [ ] Refatorar para ES6
* [ ] Criar versão sem jQuery (Vanilla JS)
* [ ] Adicionar botões de próximo/anterior
* [ ] Adicionar responsividade
* [ ] Pausar slider ao passar o mouse
* [ ] Transformar em plugin reutilizável

---

## 👨‍💻 Autor

Ricardo Henriques

---


