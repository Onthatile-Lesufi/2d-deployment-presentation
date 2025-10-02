import AdminView from "../components/AdminView";
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function AdminEditPage(){
    const { id } = useParams();
    return(
        <div>
            <AdminView id={id}/>
        </div>
    )
}

export default AdminEditPage;