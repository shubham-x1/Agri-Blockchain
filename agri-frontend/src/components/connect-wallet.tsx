"use client"
import React from "react";
import { Button } from "@mui/material";
import { useWeb3 } from "../hooks/use-web3";

const ConnectWallet = () => {
  const { connect } = useWeb3();

  return (
    <Button variant="contained" color="primary" onClick={connect}>
      Connect Wallet
    </Button>
  );
};

export default ConnectWallet;

