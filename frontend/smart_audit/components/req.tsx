'use client'
import { useEffect, useState } from 'react';
import { RequestLogicTypes } from '@requestnetwork/types';

interface PaymentRequestProps {
	token: string | RequestLogicTypes.ICurrency,
	payerAddress: string,
	requestAmount: RequestLogicTypes.Amount
}

export default function PaymentRequest({token, payerAddress, requestAmount}: PaymentRequestProps){
  const [slug, setSlug] = useState("");  
  useEffect(() => {
		// @ts-ignore
		if (token, newAddress, payerAddress, requestAmount) {
      setSlug("0x123");
			// createPaymentRequest(currency, newAddress, payerAddress, requestAmount)
			// 	.then(r => setSlug(r))
		}
	}, [token, payerAddress, requestAmount])

	return <a href={`https://pay.request.network/${slug}`}>Payment link</a>
}