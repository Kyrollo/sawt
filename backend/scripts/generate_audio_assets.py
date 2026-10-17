import asyncio
import shutil
import subprocess
from pathlib import Path
import edge_tts
import imageio_ffmpeg

# Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
CALLS_AUDIO_DIR = BACKEND_DIR / "data" / "audio" / "calls"
SAMPLES_AUDIO_DIR = BACKEND_DIR / "data" / "audio" / "samples"
FRONTEND_PUBLIC_DIR = BACKEND_DIR.parent / "frontend" / "public"
FRONTEND_CALLS_DIR = FRONTEND_PUBLIC_DIR / "audio" / "calls"
FRONTEND_SAMPLES_DIR = FRONTEND_PUBLIC_DIR / "samples"

for d in [CALLS_AUDIO_DIR, SAMPLES_AUDIO_DIR, FRONTEND_CALLS_DIR, FRONTEND_SAMPLES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

# Call transcript specifications with genuine regional country dialects and authentic phonetic vocalizations
CALLS = {
    "call-gulf-101": {
        "title": "Saudi/Gulf Telecom (لهجة خليجية سعودية أصيلة)",
        "dialect": "GULF",
        "sample_name": "test_arabic_call_gulf",
        "turns": [
            ("ar-SA-HamedNeural", "يَا هَلَا وِمِسْهَلَا وَالله، حَيَّاكِ الله بْشَرِكِةِ الاِتِّصَالَاتْ مَعَكْ خَالِدْ.. وِشْلُونْ أَقْدَرْ أَخْدِمِكْ طَالْ عُمْرِكْ؟", "+0%"),
            ("ar-KW-FahedNeural", "هَلَا وَالله أَخُويْ خَالِدْ، مَسَّاكِ الله بَالْخِيرْ.. يَا خُويْ فَاتُورَة الجَوَّالْ هَالشَّهَرْ طَالْعَة وَايِدْ مِرْتَفْعَة، وِأَبِي أَعْرِفِ السَّالْفَة، شْلُونِ انْحِسْبَتْ عَلَيَّ بَاقِةْ الفَايْفْ جِي؟", "+2%"),
            ("ar-SA-HamedNeural", "أَبْشِرْ بْسَعْدِكْ وِعَيْنْ فْرَاشْ وِعَيْنْ غَطَا، سَمّْ طَالْ عُمْرِكْ.. شَيَّكْتْ لِكْ عَالْحِسَابْ وِلْقِيتِ اشْتِرَاكْ خِدْمَة نِزِلْ بَالْغَلَطْ، وِأَنَا الحِينْ لِغِيتَهْ وِنَزَّلْتْ لِكْ خَصِمْ خَمْسِينْ رِيَالْ عَالْفَاتُورَة.", "+0%"),
            ("ar-KW-FahedNeural", "كِفُو وَالله وِبَيَّضِ الله وِجْهِكْ يَا خَالِدْ، مَا قَصَّرْتْ يَا بَعَدْ رَاسِي وِتِسْلَمْ يِمِينِكْ، زِينْ مَا سَوِّيتْ.", "+1%"),
        ]
    },
    "call-egypt-102": {
        "title": "Egyptian Cairo FinTech (لهجة مصرية قاهرية أصيلة)",
        "dialect": "EGYPTIAN",
        "sample_name": "test_arabic_call_egypt",
        "turns": [
            ("ar-EG-ShakirNeural", "أَلُو، يَا فَنْدِمْ صَبَاحِ الفُلّْ! مَعَ حَضْرِتَكْ أَحْمَدْ مِنْ خِدْمِةْ العُمَلَا.. إِزَّيَّكْ؟ يَا رَبّْ تْكُونْ بْخِيرْ، أَقْدَرْ أَخْدِمْ حَضْرِتَكْ بِإِيهِ النَّهَارْدَهْ؟", "+5%"),
            ("ar-EG-SalmaNeural", "إِزَّيَّكْ يَا أَحْمَدْ يَا بْنِي، إِلْحَأْنِي! أَنَا بَاعِتْ تَحْوِيلْ خَمَسْتَلَافْ جِنِيهْ مِنَ الصُّبْحْ وِمَوَصَلُوشْ لِحَدْ دِلْوَأْتِي وِالفِلُوسْ مَخْصُومَة! دِي مَصَارِيفْ مُسْتَشْفَى وِمِسْتَعْجِلْ جِدًّا، هَتِعْمِلُوا إِيه فِي المُصِيبَة دِي يَعْنِي؟! ", "+4%"),
            ("ar-EG-ShakirNeural", "حَقَّكْ عَلَيَّا يَا فَنْدِمْ وِرَاسَكْ عَنْدِي مَتِئْلَقْشِ خَالِصْ.. أَنَا بَاصِصْ فِي السِّيسْتِمْ حَالاً، المُعَامَلَة بَسّْ كَانِتْ مِحْتَاجَة تَأْكِيدْ مِنَ البَنْكْ وِخِلَالْ عَشَرْ دَقَايِقْ بِالكِتِيرْ هَتْكُونْ مْسَمَّعَة عَنْدَكْ فِي المَحْفَظَة، عِينِي لِيكْ!", "+6%"),
            ("ar-EG-SalmaNeural", "رَبِّنَا يِخَلِّيكْ يَا أَحْمَدْ يَا بْنِي وِيْطَمِّنْ قَلْبَكْ، أَلْفِ شُكْرْ لِيكْ عَلَى ذُوقَكْ وِجَدْعَنْتَكْ وِسُرْعِةْ حَلَّكْ.", "+3%"),
        ]
    },
    "call-levant-103": {
        "title": "Levantine Syrian Express (لهجة شامية سورية أصلية)",
        "dialect": "LEVANTINE",
        "sample_name": "test_arabic_call_levant",
        "turns": [
            ("ar-SY-AmanyNeural", "يِسْعَدْ صَبَاحَكْ يَا رَبّْ وِأَهْلًا وِسَهْلًا فِيكْ بْشِرْكِةْ التَّوْصِيلْ، مَعَكْ رَنَا.. تِكْرَمْ عَيْنَكْ كِيفْ فِينِي سَاعْدَكِ اليَوْمْ؟", "+3%"),
            ("ar-SY-LaithNeural", "مَرْحَبَا أُخْتِي رَنَا، وَالله صَارْلِي نَاطِرْ الشَّحْنِةْ أَرْبَعْ أَيَّامْ وِكِلْ مَا بْدِءِّلْكُنْ بِتْئُولُولِي بِالطَّرِيءْ! شُو الأِصَّة يَعْنِي؟ بِدِّي يَاهَا اليَوْمْ ضَرُورِي مَا بِئْدَرْ أَجِّلْ أَكْتَرْ مِنْ هِيكْ!", "+4%"),
            ("ar-SY-AmanyNeural", "حَقَّكْ عَلَيْنَا يَا أَخِي وِمِيِّةْ أَهْلًا وِسَهْلًا فِيكْ، تِكْرَمْ عَيْنَكْ هَلَّأْ فَوْرًا بَحْكِي مَعَ الشُّوفِيرْ وِبْخَلِّيهْ يْسَلْمَكْ يَاهَا بَعْدِ الضُّهْرْ، وَلَا تَاكُلْ هَمّْ أَبَدًا.", "+2%"),
            ("ar-SY-LaithNeural", "يِسْلَمُوا إِيدِيكِي يَا رَنَا كِلِّكْ ذُوقْ، الله يَعْطِيكِي أَلْفْ عَافْيِةْ يَا رَبّْ وِمَا قَصَّرْتِي.", "+3%"),
        ]
    },
    "call-msa-104": {
        "title": "Moroccan Maghrebi Support (لهجة مغاربية مغربية دارجة)",
        "dialect": "MAGHREBI",
        "sample_name": "test_arabic_call_maghrebi",
        "turns": [
            ("ar-MA-JamalNeural", "السَّلَامُ عَلَيْكُمْ خُويَا، كِيدَايِرْ لَابَاسْ عْلِيكْ؟ مْعَاكْ كَرِيمْ مِنْ مَصْلَحَةِ الزَّبَنَاءْ، كِفَاشْ نْقْدَرْ نْعَاوْنَكِ اليُومْ؟", "+2%"),
            ("ar-MA-MounaNeural", "أَهْلًا خُويَا كَرِيمْ، عَنْدِي وَاحِدْ الْمُشْكِلْ دَابَا فَالْحِسَابْ دْيَالِي.. الكُونَكْسْيُونْ تْقِيلَة بْزَّافْ وِدَازَتْ سِيمَانَة وِمَا كَايِنْ حْتَّى شِي حَلّْ، وَاشْ كَايِنْ شِي بْلُوكَاجْ عَاَفَاكْ؟", "+2%"),
            ("ar-MA-JamalNeural", "مَا كَايِنْ حْتَّى مُشْكِلْ أَ خَايْ، دَابَا نْشُوفْ مْعَاكْ لَا لِينِي وِنْصَلْحُو لِيكْ هَادْ العَطَبْ دِيرِيكْتْ، غِيرْ اِرْتَاحْ.", "+3%"),
            ("ar-MA-MounaNeural", "الله يِحْفَظَكْ أَ خُويَا بَارَكَ الله فِيكْ، شُكْرًا بْزَّافْ عَلَى المْعَامْلَة الزْوِينَة.", "+2%"),
        ]
    },
    "call-msa-105": {
        "title": "Corporate Enterprise Airline (عربية فصحى معاصرة)",
        "dialect": "MSA",
        "sample_name": "test_arabic_call_msa",
        "turns": [
            ("ar-SA-HamedNeural", "مَرْحَبًا بِكُمْ فِي مَرْكَزِ خِدْمَاتِ الطَّيَرَانِ، مَعَكُمْ طَارِقْ.. كَيْفَ يُمْكِنُنِي مُسَاعَدَةُ حَضْرَتِكُمُ اليَوْمْ؟", "+0%"),
            ("ar-AE-HamdanNeural", "أَهْلًا بِكَ أَخِي طَارِقْ، أَرَدْتُ الاِسْتِفْسَارَ عَنْ تَأْكِيدِ حَجْزِ رِحْلَتِي، وَتَعْدِيلِ مَوْعِدِ المُغَادَرَةِ إِلَى الغَدْ.", "+1%"),
            ("ar-SA-HamedNeural", "يَسْعَدُنِي خِدْمَتُكَ بِكُلِّ سُرُورْ، تَمَّ التَّحَقُّقُ مِنَ التَّذْكِرَةِ وَتَعْدِيلُ المَوْعِدِ بِنَجَاحْ مَعَ إِرْسَالِ التَّأْكِيدِ لِبَرِيدِكُمُ الإِلِكْتْرُونِي.", "+0%"),
            ("ar-AE-HamdanNeural", "شُكْرًا جَزِيلًا لَكَ عَلَى حُسْنِ التَّعَامُلِ وَسُرْعَةِ الإِنْجَازْ، بَارَكَ اللهُ فِيكْ.", "+1%"),
        ]
    }
}

async def generate_turn(voice: str, text: str, output_path: Path, rate: str = "+0%"):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(output_path))

async def create_full_call_audio(call_id: str, data: dict):
    temp_dir = BACKEND_DIR / "data" / "audio" / "temp" / call_id
    temp_dir.mkdir(parents=True, exist_ok=True)
    turn_files = []

    print(f"Generating authentic dialect audio turns for {call_id} ({data['dialect']})...")
    for idx, (voice, text, rate) in enumerate(data["turns"]):
        t_file = temp_dir / f"turn_{idx}.mp3"
        await generate_turn(voice, text, t_file, rate=rate)
        turn_files.append(t_file)

    # Concat files using ffmpeg concat demuxer with relative paths (safe on Windows)
    concat_list = temp_dir / "concat.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for tf in turn_files:
            f.write(f"file '{tf.name}'\n")

    output_mp3 = CALLS_AUDIO_DIR / f"{call_id}.mp3"
    cmd = [
        FFMPEG_EXE, "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "24000",
        str(output_mp3)
    ]
    subprocess.run(cmd, cwd=temp_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  -> Created {output_mp3} ({output_mp3.stat().st_size} bytes)", flush=True)

    # Also copy to frontend public directory
    frontend_mp3 = FRONTEND_CALLS_DIR / f"{call_id}.mp3"
    shutil.copy2(output_mp3, frontend_mp3)

    # If Moroccan call (call-msa-104), also provide call-maghrebi-104 alias files
    if call_id == "call-msa-104":
        shutil.copy2(output_mp3, CALLS_AUDIO_DIR / "call-maghrebi-104.mp3")
        shutil.copy2(output_mp3, FRONTEND_CALLS_DIR / "call-maghrebi-104.mp3")

    # Also create sample upload test files in MP3 and WAV
    sample_name = data["sample_name"]
    sample_mp3 = SAMPLES_AUDIO_DIR / f"{sample_name}.mp3"
    shutil.copy2(output_mp3, sample_mp3)
    shutil.copy2(output_mp3, FRONTEND_SAMPLES_DIR / f"{sample_name}.mp3")

    # Generate WAV version as well for wav upload testing
    sample_wav = SAMPLES_AUDIO_DIR / f"{sample_name}.wav"
    cmd_wav = [
        FFMPEG_EXE, "-y", "-i", str(output_mp3),
        "-ar", "16000", "-ac", "1",
        str(sample_wav)
    ]
    subprocess.run(cmd_wav, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    shutil.copy2(sample_wav, FRONTEND_SAMPLES_DIR / f"{sample_name}.wav")
    print(f"  -> Created sample WAV {sample_wav} ({sample_wav.stat().st_size} bytes)", flush=True)

    # Cleanup temp
    shutil.rmtree(temp_dir, ignore_errors=True)

async def main():
    print("Starting Authentic Dialect Audio Generation (Gulf, Egyptian, Levantine, Maghrebi, MSA)...", flush=True)
    for call_id, call_data in CALLS.items():
        await create_full_call_audio(call_id, call_data)
    print("All authentic dialect audio generation finished successfully!", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
