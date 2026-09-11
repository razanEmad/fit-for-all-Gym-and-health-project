from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/gym",
    tags=["Gym AI"]
)


@router.post("/analyze")
async def analyze_gym_machine(
    image: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Make sure a file was uploaded
    if not image:
        raise HTTPException(
            status_code=400,
            detail="No image uploaded"
        )

    # Make sure it is an image
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )

    return {
        "message": "Image received successfully",
        "filename": image.filename,
        "content_type": image.content_type,
        "user": current_user["name"]
    }