import axios, { AxiosResponse, HttpStatusCode } from 'axios';
import { FilmotMetadataResponseDTO } from './dtos/FilmotMetadataResponse.dto';

const FILMOT_PARAMS = {
    KEY: 'md5paNgdbaeudounjp39'
}

export const FILMOTClient = axios.create({
    baseURL: `https://filmot.com/api/`
});


export const getFilmotMetadata = async (video_id: string): Promise<FilmotMetadataResponseDTO[]> => {
    try {
        const res: AxiosResponse = await FILMOTClient.get(`getvideos?key=${FILMOT_PARAMS.KEY}&id=${video_id}`);
        return res.data as FilmotMetadataResponseDTO[];
    } catch (e) {
        throw new Error(e.response?.data?.message, e.response?.data?.code);
    }
};