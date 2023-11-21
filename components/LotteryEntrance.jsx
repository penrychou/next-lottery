import { contractAddresses, abi } from '../constants/index'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { useNotification } from '@web3uikit/core'

export default function LotteryEntrance() {

    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")
    const [numberPlayers, setNumberPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })


    const { runContractFunction: getEntranceFee } =
        useWeb3Contract({
            abi: abi,
            contractAddress: raffleAddress,
            functionName: "getEntranceFee",
            params: {},
        });


    const { runContractFunction: getNumberOfPlayers } =
        useWeb3Contract({
            abi: abi,
            contractAddress: raffleAddress,
            functionName: "getNumberOfPlayers",
            params: {},
        });
    const { runContractFunction: getRecentWinner } =
        useWeb3Contract({
            abi: abi,
            contractAddress: raffleAddress,
            functionName: "getRecentWinner",
            params: {},
        });

    async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numberPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeFromCall)
        setNumberPlayers(numberPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)


    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        // wait tx comfirm
        await tx.wait(1)
        updateUIValues()
        handleNewNotification(tx)
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "TX Notification",
            position: 'topR',
            icon: "bell"
        })
    }


    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => { console.log(error) }
                            }
                            )
                        }
                        disabled={isFetching || isLoading}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numberPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}