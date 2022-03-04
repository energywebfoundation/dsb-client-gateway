import React, { useEffect, useState } from "react"
import 'regenerator-runtime/runtime'
import matchSorter from 'match-sorter'
import { MenuItem, Menu, Theme, Icon } from "@material-ui/core"
import { makeStyles } from '@material-ui/styles'
import { useTable, useSortBy, usePagination, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import {
    ApplicationHeader as ApplicationHeaderType,
    Application as ApplicationType,
    TopicList as TopicType
} from '../../utils'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import Link from 'next/link'

const options = [{
    id: 1,
    name: 'Vikas'
},
{
    id: 2,
    name: 'Vikas'

}]

function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}


// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    useEffect(() => {

    }, [])

    return (
        <span>
            Search:{' '}
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value)
                    onChange(e.target.value)
                }}
                placeholder={`${count} records...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                }}
            />
        </span>
    )
}

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
}) {
    const count = preFilteredRows.length

    return (
        <input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || '') // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
        />
    )
}

const Tags = ({ values }) => {
    const classes = useStyles()

    // Loop through the array and create a badge-like component instead of a comma-separated string
    return (
        <>
            {values.map((tag, idx) => {
                return (
                    <span key={idx} className={classes.span}>
                        {tag}
                    </span>
                )
            })}
        </>
    )
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val



type TableProps = {
    headers: ApplicationHeaderType[] | undefined
    dataRows: ApplicationType[] | TopicType[] | undefined
    location?: string | undefined
}

function TopicTable({ headers, dataRows, location }: TableProps) {

    const router = useRouter()

    const isActive = (pathname: string) => (router.pathname === pathname ? classes.active : '')

    const [openMenu, setOpenMenu] = useState(false)
    const [filterInput, setFilterInput] = useState("")

    //shallow copy to avoid duplicate headers as using React.useMemo
    const newHeaders = headers?.map((header) => header)

    newHeaders?.push({
        id: 'edit',
        accessor: '',
        filter: 'false',
        Cell: ({ value }) => {

            let name = 'Application 1'
            if (location === 'Application') {
                return <Link href={`/topics?applicationName=${name}`}>
                    {<a className={clsx(classes.navLink, isActive('/topics'))}><Icon>threeDots</Icon></a>}
                </Link >
            } else {
                return (<button onClick={() => {
                    setOpenMenu(true)
                }}> More Options</button >)
            }
        }

    })

    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )


    const handleFilterChange = e => {
        const value = e.target.value || undefined
        setFilterInput(value)
    }

    const classes = useStyles()
    const data = React.useMemo(() => dataRows, [dataRows])


    const columns = React.useMemo(
        () => newHeaders,
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,

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
        // state: { pageIndex, pageSize, },
        preGlobalFilteredRows,
        setGlobalFilter,
        visibleColumns

    } = useTable({
        defaultColumn, // Be sure to pass the defaultColumn option
        filterTypes,
        columns,
        data,
        initialState: { pageIndex: 0, pageSize: 3 },
    },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
    )

    return (

        <div>
            <table className={classes.table}  {...getTableProps()}>

                <thead>
                    <tr>
                        <th
                            colSpan={visibleColumns.length}
                            style={{
                                textAlign: 'left',
                            }}
                        >
                            <GlobalFilter
                                preGlobalFilteredRows={preGlobalFilteredRows}
                                globalFilter={state.globalFilter}
                                setGlobalFilter={setGlobalFilter}
                            />
                        </th>
                    </tr>

                    {headerGroups.map((headerGroup, index) => (
                        <tr key={index} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column, key) => (
                                <th key={key}
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    style={{

                                        background: '#343E55',
                                        color: '#C6C9CE',
                                        'textAlign': 'left',
                                        'padding': '1em',
                                        'fontSize': '12px',
                                        'lineHeight': '14px',
                                        'letterSpacing': '0.08em'
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
                                                'textAlign': 'left',
                                                'fontFamily': 'Sequel Sans',
                                                'fontStyle': 'normal',
                                                'fontWeight': 'normal',
                                                'fontSize': '14px',
                                                'lineHeight': '17px',
                                                'borderCollapse': 'separate',
                                                'borderSpacing': '0 1em',
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
                        {state.pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>

                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}

            </div>

            <br />
            <div style={{ color: '#C6C9CE', }}>Showing the first {state.pageSize} results of {page.length} rows</div>

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
    },
    span: {
        color: 'darkolivegreen',
        background: theme.palette.secondary.main,
    },
    navLink: {
        fontSize: '1rem',

        '&:hover': {
            textDecorationLine: 'underline',
            color: theme.palette.secondary.main
        }
    },
    active: {
        color: theme.palette.secondary.main
    }
}))

export default TopicTable

