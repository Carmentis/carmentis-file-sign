async function onLoad() {
    Carmentis.registerNodeEndpoint('https://node.testapps.carmentis.io');
    Carmentis.registerDataEndpoint('https://data.testapps.carmentis.io');

    // load the identifier
    const id = document.getElementById('id').value;
    const applicationId = document.getElementById('appId').value;
    const fileSignId = document.getElementById('fileSignId').value;

    let answer = await Carmentis.wallet.request({
        qrElementId: 'qr', // QRCode identifier
        type: 'authentication',
        applicationId: applicationId,
        data: {
            id: id,
        },
        allowReconnection: false,
        operatorURL: 'https://testapps.carmentis.io',
    });


    if (answer.success) {
        // we redirect the user to the review page.
        // the provided proof is a signature of the proof.
        const proof = JSON.stringify(answer.proof);
        const serializedProof = btoa(proof);
        const url = `/review/review/${fileSignId}/${serializedProof}`;
        window.location = url;
    } else {
        // on error, we redirect to the error page
        console.log('Error...', answer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    onLoad();
});
