import { defineStore } from "pinia";

export const useWalletStore=defineStore('wallet',{
    state:()=>({
        wallet_info:{
            wallet_address:"",
            network_id:"",
        },
        temp_address:""
    }),

    getters:{
        getWalletInfo:(state)=>state.wallet_info,
        getTempAddress:(state)=>state.temp_address
    },

    actions:{
        setWalletAddress(address){
            this.wallet_info.wallet_address=address;
        },
        setNetworkId(id){
            this.wallet_info.network_id=id;
        },
        setTempAddress(adress){
            this.temp_address=adress;
        },
        resetTempAddress(){
            this.temp_address=this.wallet_info.wallet_address;
        }
    }
})