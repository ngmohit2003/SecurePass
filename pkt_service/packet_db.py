# Save Metadata to Supabase DB
from supabase_client import supabase

def save_capture_metadata(email, capture_id, file_path, packet_count, duration):
    supabase.table("packet_captures").insert({
        "owner_email": email,
        "capture_id": capture_id,
        "file_path": file_path,
        "packet_count": packet_count,
        "duration": duration
    }).execute()




def get_capture_by_id(email: str, capture_id: str):
    response = (
        supabase
        .table("packet_captures")
        .select("*")
        .eq("owner_email", email)
        .eq("capture_id", capture_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]



def get_captures_by_user(email: str):
    response = (
        supabase
        .table("packet_captures")
        .select("capture_id, file_path, packet_count, duration, created_at")
        .eq("owner_email", email)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []