import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';
import * as RequestNetwork from '@requestnetwork/request-client.js';
import { RequestLogicTypes } from '@requestnetwork/types';

export async function createPaymentRequest(
        currency: string | RequestLogicTypes.ICurrency, 
        payeeAddress: string, payerAddress: string, 
        requestAmount: RequestLogicTypes.Amount
    ){
    
    // payee information
    const payeeSignatureInfo = {
        method: RequestNetwork.Types.Signature.METHOD.ECDSA,
        privateKey: process.env.NEXT_PUBLIC_REQUEST_PRIVATE_KEY!,
    };

    const payeeIdentity = {
        type: RequestNetwork.Types.Identity.TYPE.ETHEREUM_SMART_CONTRACT,
        value: payeeAddress,
    };

    // payer information
    const payerIdentity = {
        type: RequestNetwork.Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerAddress, 
    };

    // Signature providers
    const signatureProvider = new EthereumPrivateKeySignatureProvider(payeeSignatureInfo);

    const requestInfo: RequestNetwork.Types.IRequestInfo = {
        currency: currency,
        expectedAmount: requestAmount,
        payee: payeeIdentity,
        payer: payerIdentity,
    };

    const paymentNetwork: RequestNetwork.Types.Payment.PaymentNetworkCreateParameters = {
        id: RequestNetwork.Types.Extension.PAYMENT_NETWORK_ID.ERC20_ADDRESS_BASED,
        parameters: {
          paymentAddress: payeeAddress,
        },
    };

    const requestNetwork = new RequestNetwork.RequestNetwork({
        nodeConnectionConfig: { baseURL: "https://xdai.gateway.request.network/" },
        signatureProvider,
        // useMockStorage: true,
      });

      const createParams = {
        paymentNetwork,
        requestInfo,
        signer: payeeIdentity,
      };
    let requestId: string;

    const request = await requestNetwork.createRequest(createParams);
    const confirmedRequest = await request.waitForConfirmation();
    console.log('request id: ', confirmedRequest.requestId);

    return confirmedRequest.requestId;
}
