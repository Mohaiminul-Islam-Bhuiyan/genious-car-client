import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthProvider/AuthProvider';
import OrderRow from './OrderRow';

const Orders = () => {
    const { user, logout } = useContext(AuthContext)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        fetch(`https://genious-car-server.vercel.app/orders?email=${user?.email}`, {
            headers: {
                authorization: `Bearer ${localStorage.getItem('genious-token')}`
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 4 - 3) {
                    return logout()
                }
                return res.json()
            })
            .then(data => {
                // console.log('received', data);
                setOrders(data)
            })
    }, [user?.email, logout])

    const handleDelete = id => {
        const proceed = window.confirm('are you sure to cancel this order')
        if (proceed) {
            fetch(`https://genious-car-server.vercel.app/orders/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (data.deletedCount > 0) {
                        alert('deleted successfully')
                        const remaining = orders.filter(odr => odr._id !== id)
                        setOrders(remaining)
                    }
                })
        }
    }

    const handleStatusUpdate = id => {
        fetch(`https://genious-car-server.vercel.app/orders/${id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ status: 'Approved' })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.modifiedCount > 0) {
                    const remaining = orders.filter(odr => odr._id !== id)
                    const approving = orders.find(odr => odr._id === id)
                    approving.status = "Approved"

                    const newOrders = [approving, ...remaining]
                    setOrders(newOrders)
                }
            })
    }

    return (
        <div>
            <h2 className='text-5xl'>You have: {orders.length} orders</h2>
            <div className="overflow-x-auto w-full">
                <table className="table w-full">

                    <thead>
                        <tr>
                            <th>

                            </th>
                            <th>Name</th>
                            <th>Job</th>
                            <th>Favorite Color</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orders.map(order => <OrderRow
                                key={order._id}
                                order={order}
                                handleDelete={handleDelete}
                                handleStatusUpdate={handleStatusUpdate}
                            ></OrderRow>)
                        }
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default Orders;