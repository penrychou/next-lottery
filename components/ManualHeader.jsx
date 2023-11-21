import { useMoralis } from "react-moralis";
import { useEffect } from 'react'
import Moralis from "moralis-v1";

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Morali, deactivateWeb3, isWeb3EnableLoading } = useMoralis()

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])


    useEffect(() => {
        Moralis.onAccountChanged((newAccount) => {
            console.log(`Account changed to ${newAccount}`)
            if (newAccount == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null Account found")
            }
        })
    }, [])

    return (<div>
        {account ?
            (<div>Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}</div>)
            : (<button onClick={async () => {
                await enableWeb3()
                if (typeof window !== "undefined") {
                    window.localStorage.setItem("connected", "injected")
                }
            }} disabled={isWeb3EnableLoading}>connect wallet</button>)}
    </div>)


}