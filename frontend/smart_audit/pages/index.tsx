import { ConnectButton } from "@rainbow-me/rainbowkit";
//import { Button } from "../.next/components/button";

import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import styles from "../styles/Home.module.css";

// import PaymentRequest from "../components/RequestNetwork";
import { RequestLogicTypes } from '@requestnetwork/types';

//Diego's import
import React, { Fragment, useEffect } from 'react';
import Formulario from '../components/Formulario'
import Menu from '../components/Menu'
//import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import TwoFilesUpload from '../components/TwoFilesUpload'
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Result from '../components/Result'



const Home: NextPage = () => {
  const [requestAmount, setRequestAmount] = useState('');

  const [paymentLink, setPaymentLink] = useState('');
  const { address } = useAccount();
  const [data, inputAI] = useState({});

  const [ result, setResultado ] = useState(false) //#2

  const [activateFileInput, setActivateFileInput] = useState(true);


  return (
    <div className={styles.container}>
      <Menu />
      <Head>
        <title>SC Auditors App</title>
        <meta
          content="Generated by @rainbow-me/create-rainbowkit"
          name="description"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />


      </Head>

      <main className={styles.main}> 
        <ConnectButton />

        <h1 className={styles.title}>Thank you for keeping building!</h1>


        <div className={styles.grid}>
          <a className={styles.card} href="https://rainbowkit.com">
            <h2>Check my reward &rarr;</h2>
          </a>

        </div>
        
        
        <Fragment>

          <FormControlLabel control={
            <Switch 
              defaultChecked 
              onChange={(e) => setActivateFileInput(!activateFileInput)} />} 
              label={
                activateFileInput
                ? "Address uploads mode"
                : "File uploads mode" 
              }
            />

          {activateFileInput
          ? <Formulario resultFunction={setResultado} user_address={address} />
          : <TwoFilesUpload resultFunction={setResultado} user_address={address} />
          }

        {/* <button type="button" onClick={(e) => handleRequest()}></button> */}

        </Fragment>

        {result 
          ? <Result result={result} />  
          : null}

      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
};
export default Home;
