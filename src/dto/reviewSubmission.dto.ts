import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewSubmissionDto {
    @IsIn(['accepted', 'declined'], {
        message: "The 'answer' must be either 'accepted' or 'declined'.",
    })
    answer: string;

    @IsOptional()
    @IsString()
    comment?: string;
}
