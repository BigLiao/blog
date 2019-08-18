// src/main.js
import { say } from './say';
import './style.css';

const button = document.getElementById('btn');
button.addEventListener('click', handlerClick);

function handlerClick() {
    console.log('button clicked!');
    say('Hello, Webpack! Are you OK?');
}