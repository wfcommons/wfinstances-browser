from datetime import datetime
from src.database import add_to_collection

def update_download_collection(wf_ids: list[str], client_ip: str):
    collection_name = "downloads"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip,
        "wfinstances": wf_ids,
        "num_instances": len(wf_ids)
    }

    add_to_collection(collection_name, data)

def update_visualization_collection(wf_id: str, client_ip: str):
    collection_name = "visualizations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip,
        "wfinstance": wf_id,
    }

    add_to_collection(collection_name, data)

def update_simulation_collection(wf_id: str, client_ip: str):
    collection_name = "simulations"

    data = {
        "date": datetime.utcnow().date().isoformat(),
        "ip": client_ip3,
        "wfinstance": wf_id,
    }

    add_to_collection(collection_name, data)
