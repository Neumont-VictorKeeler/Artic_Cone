"use client";
import React, { useState, useEffect } from "react";
import Whiteboard from "@/app/gamePage/pageComponents/gameCanvas";
import GamePrompt from "./pageComponents/gamePrompt";
import { get } from "http";


export default function gamePage() {
    const [state, setState] = useState("whiteboard");
    async function getGAMESTATE() {
        setState("whiteboard");
    }
    useEffect(() => {
        getGAMESTATE();
    })
    if(state == "whiteboard"){
        return (
            <Whiteboard></Whiteboard>
        );
    }else{
        return (
            <GamePrompt></GamePrompt>
        );
    }
}
