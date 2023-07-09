import React, { useState } from 'react';
import styles from "../styles/Home.module.css";

import { MuiFileInput } from 'mui-file-input'

import { TextField } from '@mui/material'

import axios from 'axios';

import { useAccount, useWalletClient } from "wagmi";

import { parseUnits, zeroAddress } from "viem";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork, Types, Utils } from "@requestnetwork/request-client.js";
import { approveErc20, hasErc20Approval, hasSufficientFunds, payRequest } from '@requestnetwork/payment-processor';


const SimpleForm = ({ resultFunction }) => {

    const { address } = useAccount();

    // const [smartContractAddress, setSmartContractAddress] = useState("");
    const [smartContractFile, setSmartContractFile] = useState(null);

    const [error, guardarError] = useState(false);


      // const [requestAmount, setRequestAmount] = useState('');
  // const [paymentLink, setPaymentLink] = useState('');
  const { data: walletClient, isError, isLoading } = useWalletClient();
  
  // const companyAddress = process.env.NEXT_PUBLIC_SAFE_ADDRESS!;
  const companyAddress = '0x37f160e2A5b986988ce474365E30AB67F47452E4';
  // const companyAddress = '0xcBc7286aB21866F15A7357CAc97D824CDef6d5F2';
  const zeroAddress = '0x0000000000000000000000000000000000000000';

  const payUserRequest = async (requestId) => {
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

    if (!(await hasSufficientFunds(requestData, address))) {
      throw new Error('You do not have enough funds to pay this request');
    }
    if (!(await hasErc20Approval(requestData, address))) {
      const approvalTx = await approveErc20(requestData);
      await approvalTx.wait(1);
    }

    const tx = await payRequest(requestData);
    console.log(`tx: ${tx}`);

    const receipt = await tx.wait(1);
    console.log('receipt: ');
    console.log(receipt);
  };

  const handleRequest = async (e) => {

    // Prevent redirection
    e.preventDefault();


    const signatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://goerli.gateway.request.network/",
      },
      signatureProvider,
    });
    const requestCreateParameters = {
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
        expectedAmount: parseUnits('1', 13).toString(),
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
          value: address,
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
        value: address,
      },
    };
    requestClient
      .createRequest(requestCreateParameters)
      .then(async (request) => {
        // setStatus(APP_STATUS.PERSISTING_ON_CHAIN);
        // setRequest(request.getData());

        return request.waitForConfirmation();
      }).then(async (requestId) => {
        return requestId;
      })
      .then((requestData) => {
        return payUserRequest(requestData.requestId)
    
      }).then((() => {
        backendCall(e);
      }))
    
  };  









    const backendCall = e => {

        

        //Todo bien, pasar al componente principal

        const formData = new FormData();
        formData.append("contract", smartContractFile);
        

        axios
            .post(
                "http://localhost:8000/audit/analyse",
                formData,
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "multipart/form-data"
                    }
                })

            .then((res) => {
                alert("File Upload success");
                console.log(res);

                let content = res.data;
                let result = content["result"]["choices"][0]["message"]["content"];
                
                // Send back the response of chatgpt
                resultFunction(result);
            })
            .catch((err) => {
                console.log(err);
            });
    };



    return (
        <div className="bg-info">
            {error ? <p className={styles.grid}>There is no hash or file to audit</p> : null}
            <div className="container">
                <div className="row">

                    <form
                        onSubmit={handleRequest}
                        className="col card text-white bg-transparent mb-5 pt-5 pb-2"
                    >
                        <fieldset>
                            <legend className="text-center">Smart Contract Auditor
                            </legend>

                            <div className="row">
                            <div className="col-md-6">
                                    <div className="form-group">
                                        <h2>Upload the smart contract</h2>
                                        <MuiFileInput
                                            value={smartContractFile}
                                            onChange={(newFile) => setSmartContractFile(newFile)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p class="black-color">Price: 0.005 ETH</p>
                            </div>
                            <div className={styles.grid}>
                                <button
                                    type="submit"
                                    className={styles.grid}> Audit
                                </button>
                            </div>

                        </fieldset>


                    </form>
                </div>
            </div>

        </div>
    );
}
 
export default SimpleForm;

