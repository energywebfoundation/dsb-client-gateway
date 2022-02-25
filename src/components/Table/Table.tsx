import React, { useState, useCallback, useEffect } from "react"
// @material-ui/icons
import Dvr from "@material-ui/icons/Dvr"
import Favorite from "@material-ui/icons/Favorite"
import Close from "@material-ui/icons/Close"
import Dropdown from "react-bootstrap/Dropdown"
// import "bootstrap/dist/css/bootstrap.min.css"

import { Icon, Theme, Typography, MenuItem, MenuList, Paper, Select, Menu } from "@material-ui/core"
import { makeStyles } from '@material-ui/styles'
import ThreeDRotation from '@material-ui/icons/ThreeDRotation'

// core components
//import Button from "components/CustomButtons/Button.js"
import { useTable, useSortBy, usePagination } from 'react-table'
import dataRows from "../TableInput/TableInput"

const options = [{
    id: 1,
    name: 'Vikas'
},
{
    id: 2,
    name: 'Vikas'

}]

function TopicTable({ ...props }) {

    const [openMenu, setOpenMenu] = useState(false)
    const classes = useStyles()
    const data = React.useMemo(() => dataRows, [])

    const columns = React.useMemo(
        () => [
            {
                Header: 'VERSION',
                accessor: 'version',
            },
            {
                Header: 'TOPIC NAME',
                accessor: 'name',
            },
            {
                Header: 'SCHEMA TYPE',
                accessor: 'schemaType',
            },
            {
                Header: 'TAGS',
                accessor: 'tags',
            },
            {
                Header: 'UPDATED DATE',
                accessor: 'updatedDate',
            },
            {
                id: 'edit',
                accessor: '',
                Cell: ({ value }) => (<button onClick={() => {
                    setOpenMenu(true)
                }}> More Options</button >)
            },
        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        // rows,
        prepareRow,
        state: {
            sorting,
        },
        onSortingChange: setSorting,

        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page

        // The rest of these things are super handy, too )
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },

    } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 3 }, }, useSortBy, usePagination)



    return (

        <div>
            <table className={classes.table}  {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup, index) => (
                        <tr key={index} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column, key) => (
                                <th key={key}
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    style={{

                                        background: '#343E55',
                                        color: '#C6C9CE',
                                        'text-align': 'left',
                                        'padding': '1em',
                                        'font-size': '12px',
                                        'line-height': '14px',
                                        'letter- spacing': '0.08em'
                                    }}
                                >
                                    {column.render('Header')}
                                    {/* Add a sort direction indicator */}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>

                    {page.map((row, index) => {
                        prepareRow(row)
                        return (
                            <tr key={index} {...row.getRowProps()}>

                                {row.cells.map((cell, key) => {
                                    return (
                                        <td key={key}
                                            {...cell.getCellProps()}
                                            style={{
                                                color: '#C6C9CE',
                                                background: '#2A3044',
                                                'text-align': 'left',
                                                'font- family': 'Sequel Sans',
                                                'font- style': 'normal',
                                                'font-weight': 'normal',
                                                'font- size': '14px',
                                                'line- height': '17px',
                                                'border- collapse': 'separate',
                                                'border- spacing': '0 1em',
                                                'padding': '1em'

                                            }}
                                        >
                                            {cell.render('Cell')}

                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}



                </tbody>

            </table>

            <Menu
                key="menu"
                open={openMenu}
                onClose={e => setOpenMenu(false)}
                style={{ marginLeft: 'auto' }}>

                {options?.map((topic) => (
                    <MenuItem key={topic.id} value={topic.name}>
                        {topic.name}
                    </MenuItem>
                ))}
            </Menu>

            <br />

            <div className="pagination">

                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>{' '}

                <span style={{ color: '#C6C9CE', }}>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>

                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}

            </div>

            <br />
            <div style={{ color: '#C6C9CE', }}>Showing the first {pageSize} results of {page.length} rows</div>

        </div >

    )
}


const useStyles = makeStyles((theme: Theme) => ({

    table: {
        width: "100%",
        background: '#2A3044',
        'border- radius': '6px',

    },

    rowText: {
        position: 'absolute',
        width: '69.87px',
        height: '17px',
        left: '415.59px',
        top: '200px',
        'font- family': 'Sequel Sans',
        'font- style': 'normal',
        'font - weight': 'normal',
        'font - size': '14px',
        'line - height': '17px',
        color: '#C6C9CE'
    },
    test: {
        content: '2807',
        'font- size': '100px'
    },
    div: {
        width: '35px',
        height: '5px',
        'background-color': 'black',
        'margin': '6px 0'
    }


}))

export default TopicTable

