import React, { useState } from 'react';
import styles from "../styles/Home.module.css";

import axios from 'axios';

const Formulario = ({ user_address }) => {

    const [smartContractAddress, setSmartContractAddress] = useState("");
    const [auditFile, setAuditFile] = useState(null);

    const [error, guardarError] = useState(false);


    const submitForm = e => {

        // Prevent redirection
        e.preventDefault();
        
        // Check that we have an address
        if (smartContractAddress.trim() === '') {
            guardarError(true);
            return;
        }
        guardarError(false);
        //Todo bien, pasar al componente principal

        const formData = new FormData();
        formData.append("user_address", user_address);
        formData.append("contract_address", smartContractAddress);
        formData.append("audit", auditFile);

        console.log(formData);

        axios
            .post(
                "http://localhost:8000/audit/upload/address",
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
                                        <label>Smart Contract Hash </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="SChash"
                                            placeholder="0X24567..."
                                            onChange={(e) => setSmartContractAddress(e.target.value)}
                                            value={smartContractAddress}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Upload a file </label>
                                        <input type="file"
                                            onChange={(e) => setAuditFile(e.target.files[0])}
                                            name={auditFile}
                                        />
                                    </div>
                                </div>

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

export default Formulario;