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

import { parseUnits, zeroAddress } from "viem";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork, Types, Utils } from "@requestnetwork/request-client.js";
import { approveErc20, hasErc20Approval, hasSufficientFunds, payRequest } from '@requestnetwork/payment-processor';





const Home: NextPage = () => {
  const [requestAmount, setRequestAmount] = useState('');

  const [paymentLink, setPaymentLink] = useState('');
  const { address } = useAccount();
  const [data, inputAI] = useState({});

  const [ result, setResultado ] = useState(false) //#2

  const [activateFileInput, setActivateFileInput] = useState(true);


  // const [requestAmount, setRequestAmount] = useState('');
  // const [paymentLink, setPaymentLink] = useState('');
  const { data: walletClient, isError, isLoading } = useWalletClient();
  
  // const companyAddress = process.env.NEXT_PUBLIC_SAFE_ADDRESS!;
  const companyAddress = '0x37f160e2A5b986988ce474365E30AB67F47452E4';
  // const companyAddress = '0xcBc7286aB21866F15A7357CAc97D824CDef6d5F2';
  const zeroAddress = '0x0000000000000000000000000000000000000000';

  const payUserRequest = async (requestId: string) => {
    const signatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://goerli.gateway.request.network/",
      },
      signatureProvider,
    });
    
    const request = await requestClient.fromRequestId(requestId);
    // console.log('request: ');
    // console.log(request);

    const requestData = request.getData();
    // console.log('requestData: ');
    // console.log(requestData);

    if (!(await hasSufficientFunds(requestData, address!))) {
      throw new Error('You do not have enough funds to pay this request');
    }
    if (!(await hasErc20Approval(requestData, address!))) {
      const approvalTx = await approveErc20(requestData);
      await approvalTx.wait(1);
    }

    const tx = await payRequest(requestData);
    console.log(`tx: ${tx}`);

    const receipt = await tx.wait(1);
    console.log('receipt: ');
    console.log(receipt);
  };

  const handleRequest = async () => {
    const signatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://goerli.gateway.request.network/",
      },
      signatureProvider,
    });
    const requestCreateParameters: Types.ICreateRequestParameters = {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc',
          network: 'goerli',
          },
        // currency: {
        //   type: Types.RequestLogic.CURRENCY.ETH,
        //   value: Types.RequestLogic.CURRENCY.ETH,
        //   network: 'goerli',
        // },
        expectedAmount: parseUnits('1', 13
        ).toString(),
        // payee: {
        //   type: Types.Identity.TYPE.ETHEREUM_SMART_CONTRACT,
        //   value: companyAddress,
        // },
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_SMART_CONTRACT,
          value: companyAddress,
        },
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: address!,
        },
      },
      paymentNetwork: {        
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: 'goerli',
          paymentAddress: companyAddress, 
          feeAddress: zeroAddress,  
          feeAmount: '0',
        },
      },
      contentData: {
        // Tip: Consider using rnf_invoice v0.0.3 format from @requestnetwork/data-format
        reason: '',
        dueDate: '',
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: address!,
      },
    };
    requestClient
      .createRequest(requestCreateParameters)
      .then((request) => {
        // setStatus(APP_STATUS.PERSISTING_ON_CHAIN);
        // setRequest(request.getData());
        return request.waitForConfirmation();
      })
      .then((requestData) => {
        console.log('finished creating');
        payUserRequest(requestData.requestId)
        // .then((result) => {
        //   console.log(result);
        // });
      })
      // .catch((err) => {
      //   alert(err);
      // });  
  };  


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
