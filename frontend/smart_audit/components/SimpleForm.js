import React, { useState } from 'react';
import styles from "../styles/Home.module.css";

import { MuiFileInput } from 'mui-file-input'

import { TextField } from '@mui/material'

import axios from 'axios';

const SimpleForm = ({ resultFunction }) => {

    // const [smartContractAddress, setSmartContractAddress] = useState("");
    const [smartContractFile, setSmartContractFile] = useState(null);

    const [error, guardarError] = useState(false);


    const submitForm = e => {

        // Prevent redirection
        e.preventDefault();

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
                        onSubmit={submitForm}
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

