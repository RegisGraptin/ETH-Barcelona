import React from 'react';
//import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Link } from "react-router-dom";
//import Formulario from './Formulario';
//import User from './User'


const Menu = () => {

    return ( 
      <div class="nav">
      <ul>
        <li><a href="/" class="nav-link">Auditor</a></li>
        <li><a href="/user" class="nav-link"><em>Developer</em></a></li>
      </ul>
    </div>
     );
}
 
export default Menu;