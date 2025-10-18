import ButtonOne from './ButtonOne';

export default function DownloadCV() {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/files/.pdf'; // Ensure this path is correct
        link.download = 'Singculan-Humphrey_CV.pdf'; // Sets the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return <ButtonOne className="" text="Download CV" type="button" onClick={handleDownload} />;
}
