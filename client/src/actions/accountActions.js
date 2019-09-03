import axios from 'axios';
import {
    ADD_ACCOUNT,
    DELTE_ACCOUNT,
    GET_ACCOUNT,
    GET_TRANSACTIONS,
    ACCOUNTS_LOADING,
    TRANSACTIONS_LOADING,
    DELETE_ACCOUNT,
} from './types';

//parse accounts and send to /accounts/add
//concatenate our new account into current accounts array
//call getTransactions on new account array

export const addAccount = plaidData => dispatch => {
    const accounts = plaidData.accounts;
    axios.post("/api/plaid/accounts/add", plaidData)
        .then(res => 
            dispatch({
                type: ADD_ACCOUNT,
                payload: res.data,
            })
        )
        .then(data => accounts ?
            dispatch(getTransactions(accounts.concat(data.payload))):null
        )
        .catch(err => console.log(err))
}

//delete
export const deleteAccount = plaidData => dispatch => {
    if (window.confirm("Are you sure you want to delete")) {
        const id = plaidData.id;
        const newAccounts = plaidData.accounts.filter(
            account => account._id !== id
        );
        axios
            .delete(`/api/plaid/accounts/${id}`)
            .then(res=> 
                dispatch({
                    type: DELETE_ACCOUNT,
                    payload: id,
                })
            )
            .then(newAccounts ? 
                dispatch(getTransactions(newAccounts)):null)
            .catch(err => console.log(err))
    }
}