import React from "react"

import useContextMenu from "./ContextMenu"

const Menu = ({ outerRef }) => {
    const { xPos, yPos, menu } = useContextMenu(outerRef)

    if (menu) {
        return (
            <ul className="menu" style={{ top: yPos, left: xPos }}>
                <li>Item1</li>
                <li>Item2</li>
                <li>Item3</li>
            </ul>
        )
    }
    return <></>
}