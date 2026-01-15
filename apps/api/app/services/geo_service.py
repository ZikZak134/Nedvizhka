from sqlalchemy.orm import Session
from sqlalchemy import func, cast, text
from app.models.infrastructure import Infrastructure, InfraType
from geoalchemy2 import Geography
from typing import Dict

class GeoService:
    @staticmethod
    def calculate_distances(db: Session, lat: float, lon: float) -> Dict[str, int]:
        """
        Calculates distances (in meters) from a point (lat, lon) to nearest key infrastructure.
        Returns: {"sea": 800, "airport": 15000, "school": 450}
        """
        distances = {}
        
        # 1. Define types to check
        target_types = {
            InfraType.SCHOOL: "school",
            InfraType.AIRPORT: "airport",
            InfraType.SEA: "sea", # Will search for points marked as SEA type
            InfraType.PARK: "park",
            InfraType.SHOP: "shop",
            InfraType.HOSPITAL: "hospital"
        }

        # 2. Iterate and find nearest for each type
        # Using raw SQL for efficiency with PostGIS operators if needed, 
        # or SQLAlchemy with geoalchemy2 if configured. 
        # For simplicity without installing extra deps yet, we can use the Haversine formula 
        # OR simple Euclidean if PostGIS isn't fully active in Python env (though DB has it).
        # ideally: db.query(Infrastructure).order_by(Infrastructure.location.distance_box(point)).first()
        
        # Let's assume we use a raw SQL query for maximum compatibility with the new PostGIS image
        # ST_DistanceSphere returns meters.
        
        try:
            for type_enum, key_name in target_types.items():
                # Find ONE nearest item of this type
                # "SELECT * FROM infrastructure WHERE type = :type ORDER BY ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint(:lon, :lat)) LIMIT 1"
                
                stmt = text("""
                    SELECT 
                        ST_DistanceSphere(
                            ST_MakePoint(longitude, latitude), 
                            ST_MakePoint(:lon, :lat)
                        ) as distance_meters
                    FROM infrastructure 
                    WHERE type = :type_val
                    ORDER BY distance_meters ASC
                    LIMIT 1
                """)
                
                result = db.execute(stmt, {"lon": lon, "lat": lat, "type_val": type_enum.value}).fetchone()
                
                if result:
                     # Round to tens of meters
                    distances[key_name] = int(round(result[0], -1))
                else:
                    distances[key_name] = None
                    
        except Exception as e:
            print(f"Geo calc error: {e}")
            # Fallback (return empty or Partial)
            
        return distances
