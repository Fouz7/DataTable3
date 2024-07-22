import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function App() {
    const [rows, setRows] = useState([{ id: '', name: '' }])
    const [newRowsCount, setNewRowsCount] = useState(0)


    useEffect(() => {
        axios.post('http://localhost:8080/employee-crud', { operation: 'READ' })
            .then(response => {
                const dataWithEmptyRow = [...response.data, { id: '', name: '' }]
                setRows(dataWithEmptyRow);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const saveData = () => {
        if (newRowsCount > 0) {
            const newRowsForBulkCreate = rows.slice(-newRowsCount).map(row => {
                return { name: row.name.trim() }
            });
            console.log('Saving new rows:', newRowsForBulkCreate);

            console.log('Prepared newRows for BULK_CREATE:', newRowsForBulkCreate);
            axios.post('http://localhost:8080/employee-crud', { operation: 'BULK_CREATE', employees: newRowsForBulkCreate })
                .then(() => alert('New data created successfully'))
                .catch(error => console.error('Error creating new data:', error))

            setNewRowsCount(0);

            const existingRows = rows.slice(0, -newRowsCount - 1)
            if (existingRows.length > 0) {
                axios.post('http://localhost:8080/employee-crud', { operation: 'BULK_UPDATE', employees: existingRows })
                    .then(() => alert('Existing data updated successfully'))
                    .catch(error => console.error('Error updating data:', error))
            }
        } else {
            const dataToSave = rows.slice(0, -1)
            console.log('Updating data:', dataToSave)
            axios.post('http://localhost:8080/employee-crud', { operation: 'BULK_UPDATE', employees: dataToSave })
                .then(() => alert('Data updated successfully'))
                .catch(error => console.error('Error updating data:', error))
        }
    };

    const debouncedSaveData = debounce(saveData, 30000)

    const handleCellChange = (index, column, event) => {
        const newRows = [...rows]
        const newValue = event.currentTarget.textContent
        const oldValue = newRows[index][column]


        if (newValue !== oldValue) {
            newRows[index][column] = newValue
            if (index === rows.length - 1) {
                newRows.push({ id: '', name: '' })
                setNewRowsCount(newRowsCount + 1)
            }
            setRows(newRows)
            debouncedSaveData()
        }
    };

    return (
        <div>
            <button onClick={saveData}>Save</button>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td contentEditable
                                onInput={(e) => handleCellChange(index, 'id', e)}>{row.id}</td>
                            <td contentEditable
                                onInput={(e) => handleCellChange(index, 'name', e)}>{row.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;