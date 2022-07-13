import styles from "../styles/Home.module.css";
import { Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftAbi from "../constants/BasicNft.json";
import networkMapping from "../constants/networkMapping.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";

export default function Home() {
	// chainId comes in 0x form
	const { chainId } = useMoralis();
	const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
	const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0];
	const dispatch = useNotification();

	const { runContractFunction } = useWeb3Contract();

	async function approveAndList(data) {
		console.log("Approving...");
		const nftAddress = data.data[0].inputResult;
		const tokenId = data.data[1].inputResult;
		const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

		const approveOptions = {
			abi: nftAbi,
			contractAddress: nftAddress,
			functionName: "approve",
			params: {
				to: marketplaceAddress,
				tokenId: tokenId,
			},
		};

		await runContractFunction({
			params: approveOptions,
			onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
			onError: (error) => {
				console.log(error);
			},
		});
	}

	async function handleApproveSuccess(nftAddress, tokenId, price) {
		console.log("OK! Now time to list...");
		const listOptions = {
			abi: nftMarketplaceAbi,
			contractAddress: marketplaceAddress,
			functionName: "listItem",
			params: {
				nftAddress: nftAddress,
				tokenId: tokenId,
				price: price,
			},
		};

		await runContractFunction({
			params: listOptions,
			onSuccess: () => handleListSuccess(),
			onError: (error) => {
				console.log(error);
			},
		});
	}

	async function handleListSuccess() {
		dispatch({
			type: "success",
			message: "NFT Listing",
			title: "NFT listed",
			position: "topR",
		});
	}

	return (
		<div className={styles.container}>
			<Form
				onSubmit={approveAndList}
				// this data will be automatically passed to onSubmit, which will pass it to the function pinned to the onSubmit event.
				data={[
					{
						name: "NFT Address",
						type: "text",
						inputWidth: "50%",
						value: "",
						key: "nftAddress",
					},
					{
						name: "Token ID",
						type: "number",
						value: "",
						key: "tokenId",
					},
					{
						name: "Price (in ETH)",
						type: "number",
						value: "",
						key: "price",
					},
				]}
				title="Sell your NFT!"
				id="Main Form"
			></Form>
		</div>
	);
}
