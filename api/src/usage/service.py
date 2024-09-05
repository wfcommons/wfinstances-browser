from datetime import datetime
from src.database import update_collection

def update_download_collection(wf_ids: list[str], client_ip: str):
    collection_name = "downloads"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ips": [client_ip],
        "wfinstances": wf_ids,
        "num_instances": len(wf_ids)
    }

    update_collection(collection_name, data)

def update_visualization_collection(wf_id: str, client_ip: str):
    collection_name = "visualizations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ips": [client_ip],
        "wfinstance": wf_id,
    }

    update_collection(collection_name, data)

def update_simulation_collection(wf_id: str, client_ip: str):
    collection_name = "simulations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ips": [client_ip],
        "wfinstance": wf_id,
    }

    update_collection(collection_name, data)
