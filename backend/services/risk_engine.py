import logging

logger = logging.getLogger("AnimAI.risk")

def calculate_triage_risk(
    vision_labels: list[str],
    vision_confidence: any,
    audio_labels: list[str],
    audio_telemetry: any
) -> tuple[int, str]:
    """
    Ingests predictions from vision and audio processors and computes a blended risk score.
    """
    # 1. Extract and scale Vision Confidence (0.0 to 1.0)
    v_conf = 0.0
    if isinstance(vision_confidence, dict):
        v_conf = vision_confidence.get("Max Visual Confidence", 0.0)
    elif isinstance(vision_confidence, (int, float)):
        v_conf = float(vision_confidence)

    if v_conf > 1.0:
        v_conf /= 100.0
    v_conf = min(1.0, max(0.0, v_conf))

    # 2. Extract and scale Audio Distress Probability (0.0 to 1.0)
    a_prob = 0.0
    if isinstance(audio_telemetry, dict):
        a_prob = audio_telemetry.get("distress_prob", 0.0)
    elif isinstance(audio_telemetry, (int, float)):
        a_prob = float(audio_telemetry)

    if a_prob > 1.0:
        a_prob /= 100.0
    a_prob = min(1.0, max(0.0, a_prob))

    # Combine all labels for simple search
    all_labels = [lbl.lower() for lbl in (vision_labels + audio_labels)]

    # Clean vision check (ignore decoding or empty statuses)
    real_vision_anomalies = [
        lbl for lbl in vision_labels 
        if lbl not in [
            "No Visual Input", 
            "No External Wounds Detected", 
            "Injury Unclear / Low Activity",
            "Decoding Error", 
            "Video Reading Error", 
            "Image Processing Error"
        ]
    ]

    # Rule 1 (Critical Scale: 75 to 100)
    # If Detections include "Visible Trauma Detected" OR Audio crosses 0.80 probability
    if any("trauma" in lbl or "wound" in lbl for lbl in all_labels) or a_prob >= 0.80:
        score = 75.0 + 25.0 * max(v_conf, a_prob)
        final_score = int(round(min(100.0, max(75.0, score))))
        operational_status = "Critical"
        scenario = "Critical Locked (Trauma/High Acoustic)"

    # Rule 2 (Warning Scale: 40 to 74)
    # If Detections include "Aggression" OR "Severe Lethargy", scale linearly using audio probability
    elif any("aggression" in lbl or "lethargy" in lbl for lbl in all_labels):
        final_score = int(round(40.0 + (74.0 - 40.0) * a_prob))
        final_score = min(74, max(40, final_score))
        operational_status = "Warning"
        scenario = "Warning Scaled (Behavioral/Mood)"

    # Rule 3 (Stable Scale: 0 to 5)
    # If Detections are empty [] AND Audio distress is 0.0
    elif len(real_vision_anomalies) == 0 and a_prob == 0.0:
        score = v_conf * 5.0
        final_score = int(round(min(5.0, max(0.0, score))))
        operational_status = "Stable"
        scenario = "Stable Baseline (Clean / Healthy)"

    # Rule 4 (General Fallback Blend)
    else:
        score = (v_conf * 60.0) + (a_prob * 40.0)
        final_score = int(round(min(100.0, max(0.0, score))))
        if final_score >= 75:
            operational_status = "Critical"
        elif final_score >= 40:
            operational_status = "Warning"
        else:
            operational_status = "Stable"
        scenario = "General Blended Fallback"

    logger.info(f"Risk Evaluation ({scenario}): VisionConf={v_conf:.2f}, AudioProb={a_prob:.2f} -> Score={final_score} ({operational_status})")
    
    return final_score, operational_status
